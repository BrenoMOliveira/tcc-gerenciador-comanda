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

            SubComanda? subComanda = null;
            decimal? valorRestanteSubcomanda = null;

            if (dto.subcomandaid.HasValue)
            {
                subComanda = comanda.subcomandas.FirstOrDefault(s => s.id == dto.subcomandaid.Value);
                if (subComanda == null) return NotFound("Subcomanda nao encontrada");

                subComanda.pagamentos.Add(pagamento);

                decimal totalSub = subComanda.pedidos.Sum(p => p.precounit * p.quantidade);
                decimal pagoSub = subComanda.pagamentos.Sum(p => p.valorpago);

                valorRestanteSubcomanda = totalSub - pagoSub;
                if (valorRestanteSubcomanda < 0) valorRestanteSubcomanda = 0;

                if (pagoSub == totalSub)
                {
                    subComanda.status = "Fechada";
                }
                else if (pagoSub > 0)
                {
                    subComanda.status = "Aguardando Pagamento";
                }
            }

            decimal totalComanda = comanda.pedidos.Sum(p => p.precounit * p.quantidade)
                + comanda.subcomandas.Sum(s => s.pedidos.Sum(p => p.precounit * p.quantidade));
            decimal totalPago = comanda.pagamentos.Sum(p => p.valorpago);
            decimal valorRestante = totalComanda - totalPago;
            if (valorRestante < 0) valorRestante = 0;

            if (valorRestante <= 0 && comanda.subcomandas.All(s => s.status == "Fechada"))
            {
                comanda.status = "Fechada";
                comanda.fechadoem = DateTime.UtcNow;
            }
            else if (totalPago > 0)
            {
                comanda.status = "Aguardando Pagamento";
            }
            else
            {
                comanda.status = "Aberta";
            }

            bool mesaLiberada = false;

            if (comanda.mesanum.HasValue)
            {
                var mesa = await _context.Mesas.FirstOrDefaultAsync(m => m.numero == comanda.mesanum.Value);
                if (mesa != null)
                {
                    switch (comanda.status)
                    {
                        case "Fechada":
                            mesa.status = "Livre";
                            mesaLiberada = true;
                            break;
                        case "Aguardando Pagamento":
                            mesa.status = "Aguardando Pagamento";
                            break;
                        default:
                            mesa.status = "Ocupada";
                            break;
                    }
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                pagamento,
                status = comanda.status,
                statusSubcomanda = subComanda?.status,
                valorRestante,
                valorRestanteSubcomanda,
                mesaLiberada
            });
        }
    }
}