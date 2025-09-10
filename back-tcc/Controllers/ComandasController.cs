using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using back_tcc.Data;
using back_tcc.Models;

namespace back_tcc.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
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
            var query = _context.Comandas.AsQueryable();
            if (!string.IsNullOrEmpty(tipo))
            {
                query = query.Where(c => c.Tipo.ToLower() == tipo.ToLower());
            }
            return await query.OrderByDescending(c => c.CriadoEm).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Comanda>> GetComanda(Guid id)
        {
            var comanda = await _context.Comandas
                .Include(c => c.Pedidos)
                .FirstOrDefaultAsync(c => c.Id == id);
            if (comanda == null)
            {
                return NotFound();
            }
            return comanda;
        }

        [HttpPost]
        public async Task<ActionResult<Comanda>> CreateComanda(Comanda comanda)
        {
            _context.Comandas.Add(comanda);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetComanda), new { id = comanda.Id }, comanda);
        }
    }
}
