using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using back_tcc.Data;
using back_tcc.Models;

namespace back_tcc.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController(ApplicationDbContext context) : ControllerBase
{
    private readonly ApplicationDbContext _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
    {
        var products = await _context.Products.ToListAsync();
        var stocks = await _context.Stocks.ToDictionaryAsync(s => s.produtoid);

        foreach (var product in products)
        {
            if (stocks.TryGetValue(product.id, out var stock))
            {
                product.StockQuantity = stock.quantidade;
                product.Availability = stock.quantidade == 0
                    ? ProductAvailability.ForaDeEstoque
                    : stock.quantidade <= stock.minimoalerta
                        ? ProductAvailability.BaixoEstoque
                        : ProductAvailability.EmEstoque;
            }
            else
            {
                product.StockQuantity = 0;
                product.Availability = ProductAvailability.ForaDeEstoque;
            }
        }

        return products;
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Product>> GetProduct(Guid id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product is null) return NotFound();

        var stock = await _context.Stocks.FirstOrDefaultAsync(s => s.produtoid == id);
        if (stock is not null)
        {
            product.StockQuantity = stock.quantidade;
            product.Availability = stock.quantidade == 0
                ? ProductAvailability.ForaDeEstoque
                : stock.quantidade <= stock.minimoalerta
                    ? ProductAvailability.BaixoEstoque
                    : ProductAvailability.EmEstoque;
        }

        return product;
    }

    [HttpPost]
    public async Task<ActionResult<Product>> PostProduct(Product product)
    {
        _context.Products.Add(product);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetProduct), new { id = product.id }, product);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> PutProduct(Guid id, Product product)
    {
        if (id != product.id) return BadRequest();
        _context.Entry(product).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteProduct(Guid id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product is null) return NotFound();
        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
