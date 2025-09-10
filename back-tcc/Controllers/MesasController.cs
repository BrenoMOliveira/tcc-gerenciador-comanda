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
            var comandas = await _context.Comandas
                .Where(c => c.Status != "Fechada" && c.MesaNum != null)
                .ToListAsync();

            var mesas = await _context.Mesas.OrderBy(m => m.Numero).ToListAsync();

            foreach (var mesa in mesas)
            {
                var comanda = comandas.FirstOrDefault(c => c.MesaNum == mesa.Numero);
                if (comanda != null)
                {
                    mesa.ComandaId = comanda.Id;
                    mesa.Status = comanda.Status == "Aberta" ? "Ocupada" : comanda.Status;
                }
            }

            return mesas;
        }
    }
}
