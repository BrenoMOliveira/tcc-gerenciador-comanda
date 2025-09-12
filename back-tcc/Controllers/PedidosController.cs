using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using back_tcc.Data;
using back_tcc.Models;

namespace back_tcc.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PedidosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PedidosController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<ActionResult<Pedido>> CreatePedido(Pedido pedido)
        {
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

            _context.Pedidos.Add(pedido);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(CreatePedido), new { id = pedido.id }, pedido);
        }
    }
}
