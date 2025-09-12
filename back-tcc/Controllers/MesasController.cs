using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using back_tcc.Data;
using back_tcc.Models;
using back_tcc.Extensions;

namespace back_tcc.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MesasController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MesasController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Mesa>>> GetMesas()
        {
            var comandas = await _context.Comanda
                .Where(c => c.status != "Fechada" && c.mesanum != null)
                .ToListAsync();

            var mesas = await _context.Mesas.OrderBy(m => m.numero).ToListAsync();

            foreach (var mesa in mesas)
            {
                var comanda = comandas.FirstOrDefault(c => c.mesanum == mesa.numero);
                if (comanda != null)
                {
                    mesa.comandaid = comanda.id;
                    mesa.status = comanda.status == "Aberta" ? "Ocupada" : comanda.status;
                }
            }

            return mesas;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Mesa>> GetMesa(Guid id)
        {
            var mesa = await _context.Mesas.FirstOrDefaultAsync(m => m.id == id);
            if (mesa == null) return NotFound();

            var comanda = await _context.Comanda
                .Include(c => c.pedidos)
                .FirstOrDefaultAsync(c => c.mesanum == mesa.numero && c.status != "Fechada");

            if (comanda != null)
            {
                mesa.comandaid = comanda.id;
                mesa.comanda = comanda;
                mesa.status = comanda.status == "Aberta" ? "Ocupada" : comanda.status;
            }

            return mesa;
        }

        [HttpPost("{id}/comandas")]
        public async Task<ActionResult<Comanda>> CreateComandaMesa(Guid id)
        {
            var mesa = await _context.Mesas.FirstOrDefaultAsync(m => m.id == id);
            if (mesa == null) return NotFound();

            if (mesa.status != "Livre")
            {
                return BadRequest("Mesa não está livre");
            }

            var userId = HttpContext.GetUserId();
            if (userId is null) return Unauthorized();

            var comanda = new Comanda
            {
                id = Guid.NewGuid(),
                tipo = "Mesa",
                status = "Aberta",
                mesanum = mesa.numero,
                criadopor = userId.Value
            };

            mesa.status = "Ocupada";

            _context.Comanda.Add(comanda);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMesa), new { id = mesa.id }, comanda);
        }

        [HttpGet("{id}/subcomandas")]
        public async Task<ActionResult<IEnumerable<SubComanda>>> GetSubcomandasMesa(Guid id)
        {
            var mesa = await _context.Mesas.FirstOrDefaultAsync(m => m.id == id);
            if (mesa == null) return NotFound();

            var comanda = await _context.Comanda
                .Include(c => c.subcomandas)
                    .ThenInclude(s => s.pedidos)
                .Include(c => c.subcomandas)
                    .ThenInclude(s => s.pagamentos)
                .FirstOrDefaultAsync(c => c.mesanum == mesa.numero && c.status != "Fechada");

            if (comanda == null) return new List<SubComanda>();

            return comanda.subcomandas;
        }

        [HttpGet("{id}/subcomandas/{subId}")]
        public async Task<ActionResult<SubComanda>> GetSubcomandaMesa(Guid id, Guid subId)
        {
            var mesa = await _context.Mesas.FirstOrDefaultAsync(m => m.id == id);
            if (mesa == null) return NotFound();

            var comanda = await _context.Comanda.FirstOrDefaultAsync(c => c.mesanum == mesa.numero && c.status != "Fechada");
            if (comanda == null) return NotFound("Comanda nao encontrada");

            var sub = await _context.SubComandas
                .Include(s => s.pedidos)
                .Include(s => s.pagamentos)
                .FirstOrDefaultAsync(s => s.comandaid == comanda.id && s.id == subId);

            if (sub == null) return NotFound("Subcomanda nao encontrada");

            return sub;
        }
    }
}
