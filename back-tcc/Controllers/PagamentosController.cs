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

            decimal totalComanda = comanda.pedidos.Sum(p => p.precounit * p.quantidade);
            decimal totalPago = comanda.pagamentos.Sum(p => p.valorpago);
            if (totalPago >= totalComanda)
            {
                comanda.status = "Fechada";
                comanda.fechadoem = DateTime.UtcNow;
            }
            else
            {
                comanda.status = "Aguardando Pagamento";
            }

            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetByComanda), new { comandaId = dto.comandaid }, pagamento);
        }
    }
}