using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using back_tcc.Data;
using back_tcc.Models;
using System.Collections.Generic;
using System.Linq;

namespace back_tcc.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoryProductsController(ApplicationDbContext context) : ControllerBase
{
    private readonly ApplicationDbContext _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryProduct>>> GetCategories()
    {
        return await _context.CategoryProducts
            .OrderBy(c => c.Name)
            .ToListAsync();
    }
}