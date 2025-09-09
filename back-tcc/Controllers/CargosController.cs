using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using back_tcc.Data;
using back_tcc.Models;

namespace back_tcc.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CargosController(ApplicationDbContext context) : ControllerBase
{
    private readonly ApplicationDbContext _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CargoUsuario>>> GetCargos()
    {
        return await _context.CargosUsuario.ToListAsync();
    }
}