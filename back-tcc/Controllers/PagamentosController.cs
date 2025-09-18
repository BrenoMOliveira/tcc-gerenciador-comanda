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

        private static bool StatusEquals(string? value, string expected) =>
           string.Equals(value?.Trim(), expected, StringComparison.OrdinalIgnoreCase);

        private static bool IsClosedStatus(string? status) =>
            StatusEquals(status, "Fechada") || StatusEquals(status, "Paga");

        private static bool IsAwaitingStatus(string? status) =>
            StatusEquals(status, "Aguardando Pagamento");

        private static bool IsOpenStatus(string? status) =>
            !IsClosedStatus(status) && !IsAwaitingStatus(status);

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
            decimal totalSub = 0m;
            decimal pagoSub = 0m;
            decimal saldoSub = 0m;

            if (dto.subcomandaid.HasValue)
            {
                subComanda = comanda.subcomandas.FirstOrDefault(s => s.id == dto.subcomandaid.Value);
                if (subComanda == null) return NotFound("Subcomanda nao encontrada");

                subComanda.pagamentos.Add(pagamento);

                totalSub = subComanda.pedidos.Sum(p => p.precounit * p.quantidade);
                pagoSub = subComanda.pagamentos.Sum(p => p.valorpago);
                saldoSub = totalSub - pagoSub;

                valorRestanteSubcomanda = saldoSub > 0 ? saldoSub : 0m;

                if (saldoSub <= 0)
                {
                    subComanda.status = "Fechada";
                }
                else if (pagoSub > 0)
                {
                    subComanda.status = "Aguardando Pagamento";
                }
            }

            var pedidosSemSub = comanda.pedidos
                .Where(p => p.subcomandaid == null)
                .Sum(p => p.precounit * p.quantidade);

            var pedidosSub = comanda.subcomandas.Sum(s => s.pedidos.Sum(p => p.precounit * p.quantidade));

            decimal totalComanda = pedidosSemSub + pedidosSub;
            decimal totalPago = comanda.pagamentos.Sum(p => p.valorpago);

            decimal saldoComandaBruto = totalComanda - totalPago;
            decimal valorRestante = saldoComandaBruto > 0 ? saldoComandaBruto : 0m;
            bool comandaQuitada = saldoComandaBruto <= 0;

            bool possuiSubcomandas = comanda.subcomandas.Any();
            bool todasSubcomandasFechadas = possuiSubcomandas && comanda.subcomandas.All(s => IsClosedStatus(s.status));
            bool algumaSubAberta = possuiSubcomandas && comanda.subcomandas.Any(s => IsOpenStatus(s.status));
            bool algumaSubAguardando = possuiSubcomandas && comanda.subcomandas.Any(s => IsAwaitingStatus(s.status));

            var statusAberta = comanda.tipo.Equals("Mesa", StringComparison.OrdinalIgnoreCase) ? "Ocupada" : "Aberta";

            if (comandaQuitada && (!possuiSubcomandas || todasSubcomandasFechadas))
            {
                comanda.status = "Fechada";
                comanda.fechadoem = DateTime.UtcNow;
            }
            else if (
                (possuiSubcomandas && !todasSubcomandasFechadas && !algumaSubAberta && algumaSubAguardando) ||
                (!possuiSubcomandas && totalPago > 0 && !comandaQuitada)
            )
            {
                comanda.status = "Aguardando Pagamento";
                comanda.fechadoem = null;
            }
            else
            {
                comanda.status = statusAberta;
                comanda.fechadoem = null;
            }

            bool mesaLiberada = false;

            if (comanda.mesanum.HasValue)
            {
                var mesa = await _context.Mesas.FirstOrDefaultAsync(m => m.numero == comanda.mesanum.Value);
                if (mesa != null)
                {
                    if (comanda.status == "Fechada")
                    {
                        mesa.status = "Livre";
                        mesaLiberada = true;
                    }
                    else if (
                        possuiSubcomandas && !todasSubcomandasFechadas && !algumaSubAberta && algumaSubAguardando
                    )
                    {
                        mesa.status = "Aguardando Pagamento";
                    }
                    else if (!possuiSubcomandas && totalPago > 0 && !comandaQuitada)
                    {
                        mesa.status = "Aguardando Pagamento";
                    }
                    else
                    {
                        mesa.status = "Ocupada";
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