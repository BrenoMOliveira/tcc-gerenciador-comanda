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
    [Route("api/comandas/{comandaId}/[controller]")]
    [Authorize]
    public class SubComandasController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SubComandasController(ApplicationDbContext context)
        {
            _context = context;
        }

        public class SubComandaDto
        {
            [Required]
            public string nomeCliente { get; set; } = string.Empty;
        }

        [HttpGet("{subId}")]
        public async Task<ActionResult<SubComanda>> GetSubComanda(Guid comandaId, Guid subId)
        {
            var sub = await _context.SubComandas
                .Include(s => s.pedidos)
                .Include(s => s.pagamentos)
                .FirstOrDefaultAsync(s => s.comandaid == comandaId && s.id == subId);
            if (sub == null) return NotFound("Subcomanda nao encontrada");
            return sub;
        }


        [HttpPost]
        public async Task<ActionResult<IEnumerable<SubComanda>>> CriarSubComandas(Guid comandaId, [FromBody] List<SubComandaDto> clientes)
        {
            var comanda = await _context.Comanda.FirstOrDefaultAsync(c => c.id == comandaId);
            if (comanda == null) return NotFound("Comanda nao encontrada");

            var novas = new List<SubComanda>();
            foreach (var c in clientes)
            {
                var sub = new SubComanda
                {
                    id = Guid.NewGuid(),
                    comandaid = comandaId,
                    nomeCliente = c.nomeCliente,
                    status = "Aberta",
                    criadoem = DateTime.UtcNow
                };
                novas.Add(sub);
                _context.SubComandas.Add(sub);
            }

            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(CriarSubComandas), new { comandaId }, novas);
        }
    }
}