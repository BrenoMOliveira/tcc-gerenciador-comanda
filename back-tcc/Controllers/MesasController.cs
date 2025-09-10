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
    }
}
