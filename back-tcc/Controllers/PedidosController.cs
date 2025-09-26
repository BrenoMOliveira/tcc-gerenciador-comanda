using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using back_tcc.Data;
using back_tcc.Models;
using back_tcc.Services;

namespace back_tcc.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PedidosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IStockService _stockService;

        public PedidosController(ApplicationDbContext context, IStockService stockService)
        {
            _context = context;
            _stockService = stockService;
        }

        [HttpPost]
        public async Task<ActionResult<Pedido>> CreatePedido(Pedido pedido)
        {
            if (pedido.quantidade <= 0)
            {
                return BadRequest(new { message = "A quantidade do item deve ser maior que zero." });
            }

            if (pedido.produtoid == Guid.Empty)
            {
                return BadRequest(new { message = "Produto inválido para o pedido." });
            }

            if (pedido.id == Guid.Empty)
            {
                pedido.id = Guid.NewGuid();
            }

            if (pedido.subcomandaid.HasValue)
            {
                var sub = await _context.SubComandas.FindAsync(pedido.subcomandaid.Value);
                if (sub == null)
                {
                    return BadRequest("Subcomanda nao encontrada");
                }
                pedido.comandaid = sub.comandaid;
            }

            var stockItems = new[] { new StockItemRequest(pedido.produtoid, pedido.quantidade) };

            await using var transaction = await _context.Database.BeginTransactionAsync(HttpContext.RequestAborted);

            var stockCheck = await _stockService.CheckStockAsync(stockItems, HttpContext.RequestAborted);
            if (!stockCheck.Success)
            {
                await transaction.RollbackAsync(HttpContext.RequestAborted);
                return BadRequest(new { message = stockCheck.Message });
            }

            try
            {
                _context.Pedidos.Add(pedido);
                await _context.SaveChangesAsync(HttpContext.RequestAborted);

                await _stockService.DecreaseStockAsync(stockItems, HttpContext.RequestAborted);

                await transaction.CommitAsync(HttpContext.RequestAborted);
            }
            catch
            {
                await transaction.RollbackAsync(HttpContext.RequestAborted);
                throw;
            }

            return CreatedAtAction(nameof(CreatePedido), new { id = pedido.id }, pedido);
        }
    }
}
