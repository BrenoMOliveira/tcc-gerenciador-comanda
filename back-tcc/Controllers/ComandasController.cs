using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using back_tcc.Data;
using back_tcc.Models;
using back_tcc.Extensions;
using System.ComponentModel.DataAnnotations;

namespace back_tcc.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ComandasController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ComandasController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Comanda>>> GetComandas([FromQuery] string? tipo)
        {
            var query = _context.Comanda.AsQueryable();
            if (!string.IsNullOrEmpty(tipo))
            {
                query = query.Where(c => c.tipo.ToLower() == tipo.ToLower());
            }
            return await query.OrderByDescending(c => c.criadoem).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Comanda>> GetComanda(Guid id)
        {
            var comanda = await _context.Comanda
                .Include(c => c.pedidos)
                .FirstOrDefaultAsync(c => c.id == id);
            if (comanda == null)
            {
                return NotFound();
            }
            return comanda;
        }

        [HttpPost]
        public async Task<ActionResult<Comanda>> CreateComanda(Comanda comanda)
        {
            var userId = HttpContext.GetUserId();
            if (userId is null) return Unauthorized();
            comanda.criadopor = userId.Value;

            if ((comanda.tipo.Equals("Balcao", StringComparison.OrdinalIgnoreCase) ||
                 comanda.tipo.Equals("Entrega", StringComparison.OrdinalIgnoreCase)) &&
                string.IsNullOrWhiteSpace(comanda.nome_cliente))
            {
                return BadRequest("Nome do cliente é obrigatório para balcão ou entrega");
            }

            if (comanda.mesanum.HasValue)
            {
                var mesa = await _context.Mesas.FirstOrDefaultAsync(m => m.numero == comanda.mesanum.Value);
                if (mesa != null)
                {
                    mesa.status = "Ocupada";
                }
            }

            _context.Comanda.Add(comanda);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetComanda), new { id = comanda.id }, comanda);
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] string status)
        {
            var comanda = await _context.Comanda.FindAsync(id);
            if (comanda == null) return NotFound();

            comanda.status = status;
            if (status == "Fechada")
            {
                comanda.fechadoem = DateTime.UtcNow;
            }

            if (comanda.mesanum.HasValue)
            {
                var mesa = await _context.Mesas.FirstOrDefaultAsync(m => m.numero == comanda.mesanum.Value);
                if (mesa != null)
                {
                    mesa.status = status switch
                    {
                        "Aguardando Pagamento" => "Aguardando Pagamento",
                        "Fechada" => "Livre",
                        _ => "Ocupada"
                    };
                }
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        public class AddItemDto
        {
            [Required]
            public Guid produtoId { get; set; }

            [Range(1, int.MaxValue)]
            public int quantidade { get; set; }
        }

        [HttpPost("{id}/itens")]
        public async Task<ActionResult<Pedido>> AddItem(Guid id, [FromBody] AddItemDto item)
        {
            var comanda = await _context.Comanda.FindAsync(id);
            if (comanda == null) return NotFound();

            var produto = await _context.Products.FindAsync(item.produtoId);
            if (produto == null) return NotFound("Produto não encontrado");

            var pedido = new Pedido
            {
                id = Guid.NewGuid(),
                comandaid = id,
                produtoid = item.produtoId,
                quantidade = item.quantidade,
                precounit = produto.Price
            };

            _context.Pedidos.Add(pedido);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetComanda), new { id = comanda.id }, pedido);
        }
    }
}
