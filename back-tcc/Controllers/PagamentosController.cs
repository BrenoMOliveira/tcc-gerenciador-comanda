using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using back_tcc.Data;
using back_tcc.Models;
using System.ComponentModel.DataAnnotations;

namespace back_tcc.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PagamentosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PagamentosController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("comanda/{comandaId}")]
        public async Task<ActionResult<IEnumerable<Pagamento>>> GetByComanda(Guid comandaId)
        {
            return await _context.Pagamentos
                .Where(p => p.comandaid == comandaId)
                .ToListAsync();
        }

        public class PagamentoDto
        {
            [Required]
            public Guid comandaid { get; set; }
            public Guid? subcomandaid { get; set; }
            [Required]
            public decimal valorpago { get; set; }
            [Required]
            public string formapagamento { get; set; } = string.Empty;
        }

        [HttpPost]
        public async Task<ActionResult<Pagamento>> CreatePagamento(PagamentoDto dto)
        {
            var comanda = await _context.Comanda
                .Include(c => c.pedidos)
                .Include(c => c.pagamentos)
                .Include(c => c.subcomandas)
                    .ThenInclude(s => s.pedidos)
                .Include(c => c.subcomandas)
                    .ThenInclude(s => s.pagamentos)
                .FirstOrDefaultAsync(c => c.id == dto.comandaid);
            if (comanda == null) return NotFound("Comanda nao encontrada");

            var pagamento = new Pagamento
            {
                id = Guid.NewGuid(),
                comandaid = dto.comandaid,
                subcomandaid = dto.subcomandaid,
                valorpago = dto.valorpago,
                formapagamento = dto.formapagamento,
                pagoem = DateTime.UtcNow
            };

            _context.Pagamentos.Add(pagamento);
            comanda.pagamentos.Add(pagamento);

            if (dto.subcomandaid.HasValue)
            {
                var sub = comanda.subcomandas.FirstOrDefault(s => s.id == dto.subcomandaid.Value);
                if (sub == null) return NotFound("Subcomanda nao encontrada");
                sub.pagamentos.Add(pagamento);
                decimal totalSub = sub.pedidos.Sum(p => p.precounit * p.quantidade);
                decimal pagoSub = sub.pagamentos.Sum(p => p.valorpago);
                if (pagoSub >= totalSub)
                {
                    sub.status = "Fechada";
                }
            }

            decimal totalComanda = comanda.pedidos.Sum(p => p.precounit * p.quantidade)
                + comanda.subcomandas.Sum(s => s.pedidos.Sum(p => p.precounit * p.quantidade));
            decimal totalPago = comanda.pagamentos.Sum(p => p.valorpago);
            decimal valorRestante = totalComanda - totalPago;
            if (valorRestante < 0) valorRestante = 0;

            if (totalPago >= totalComanda && comanda.subcomandas.All(s => s.status == "Fechada"))
            {
                comanda.status = "Fechada";
                comanda.fechadoem = DateTime.UtcNow;
            }
            else if (totalPago > 0)
            {
                comanda.status = "Aguardando Pagamento";
            }

            if (comanda.mesanum.HasValue)
            {
                var mesa = await _context.Mesas.FirstOrDefaultAsync(m => m.numero == comanda.mesanum.Value);
                if (mesa != null)
                {
                    mesa.status = comanda.status switch
                    {
                        "Fechada" => "Livre",
                        "Aguardando Pagamento" => "Aguardando Pagamento",
                        _ => "Ocupada"
                    };
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { pagamento, status = comanda.status, valorRestante });
        }
    }
}