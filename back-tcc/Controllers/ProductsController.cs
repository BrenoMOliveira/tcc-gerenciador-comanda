using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using back_tcc.Data;
using back_tcc.Models;
using System.Linq;

namespace back_tcc.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController(ApplicationDbContext context) : ControllerBase
{
    private readonly ApplicationDbContext _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts(
        [FromQuery] string? search,
        [FromQuery] Guid? categoryId,
        [FromQuery] int? availabilityId)
    {
        var query = _context.Products.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var lower = search.ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(lower));
        }

        if (categoryId.HasValue)
        {
            query = query.Where(p => p.CategoryProductId == categoryId.Value);
        }

        var products = await query.ToListAsync();

        var productIds = products.Select(p => p.id).ToList();
        var stocks = await _context.Stocks
            .Where(s => productIds.Contains(s.produtoid))
            .Join(_context.AvailabilityProducts,
                s => s.disponibilidadeid,
                a => a.id,
                (s, a) => new { s.produtoid, s.quantidade, s.minimoalerta, s.disponibilidadeid, AvailabilityName = a.Name })
            .ToDictionaryAsync(x => x.produtoid);
        var categories = await _context.CategoryProducts.ToDictionaryAsync(c => c.id, c => c.Name);

        var result = new List<Product>();
        foreach (var product in products)
        {
            if (stocks.TryGetValue(product.id, out var info))
            {
                product.StockQuantity = info.quantidade;
                product.MinimoAlerta = info.minimoalerta;
                product.Availability = info.AvailabilityName;

                if (availabilityId.HasValue && info.disponibilidadeid != availabilityId.Value)
                    continue;
            }
            else
            {
                product.StockQuantity = 0;
                product.MinimoAlerta = 0;
                product.Availability = "Fora de Estoque";
                if (availabilityId.HasValue && availabilityId.Value != 0)
                    continue;
            }

            if (categories.TryGetValue(product.CategoryProductId, out var name))
            {
                product.CategoryName = name;
            }

            result.Add(product);
        }

        return result;
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Product>> GetProduct(Guid id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product is null) return NotFound();

        if (await _context.CategoryProducts.FindAsync(product.CategoryProductId) is { } category)
        {
            product.CategoryName = category.Name;
        }

        var stockInfo = await _context.Stocks
            .Where(s => s.produtoid == id)
            .Join(_context.AvailabilityProducts,
                s => s.disponibilidadeid,
                a => a.id,
                (s, a) => new { s.quantidade, s.minimoalerta, AvailabilityName = a.Name })
            .FirstOrDefaultAsync();
        if (stockInfo is not null)
        {
            product.StockQuantity = stockInfo.quantidade;
            product.MinimoAlerta = stockInfo.minimoalerta;
            product.Availability = stockInfo.AvailabilityName;
        }
        else
        {
            product.Availability = "Fora de Estoque";
        }

        return product;
    }

    [HttpPost]
    public async Task<ActionResult<Product>> PostProduct(Product product)
    {
        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        var stock = new Stock
        {
            produtoid = product.id,
            quantidade = product.StockQuantity,
            minimoalerta = product.MinimoAlerta,
            atualizadoem = DateTime.UtcNow
        };
        _context.Stocks.Add(stock);
        await _context.SaveChangesAsync();
        await _context.Entry(stock).ReloadAsync();

        var availability = await _context.AvailabilityProducts.FindAsync(stock.disponibilidadeid);

        if (await _context.CategoryProducts.FindAsync(product.CategoryProductId) is { } category)
        {
            product.CategoryName = category.Name;
        }
        product.StockQuantity = stock.quantidade;
        product.MinimoAlerta = stock.minimoalerta;
        product.Availability = availability?.Name ?? "Fora de Estoque";

        return CreatedAtAction(nameof(GetProduct), new { id = product.id }, product);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> PutProduct(Guid id, Product product)
    {
        if (id != product.id) return BadRequest();

        var existing = await _context.Products.FindAsync(id);
        if (existing is null) return NotFound();

        existing.Name = product.Name;
        existing.Price = product.Price;
        existing.Ativo = product.Ativo;
        existing.CategoryProductId = product.CategoryProductId;

        var stock = await _context.Stocks.FirstOrDefaultAsync(s => s.produtoid == id);
        if (stock is not null)
        {
            stock.quantidade = product.StockQuantity;
            stock.minimoalerta = product.MinimoAlerta;
            stock.atualizadoem = DateTime.UtcNow;
        }
        else
        {
            _context.Stocks.Add(new Stock
            {
                produtoid = id,
                quantidade = product.StockQuantity,
                minimoalerta = product.MinimoAlerta,
                atualizadoem = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync();

        var updatedStock = await _context.Stocks
            .Where(s => s.produtoid == id)
            .Join(_context.AvailabilityProducts,
                s => s.disponibilidadeid,
                a => a.id,
                (s, a) => new { s.quantidade, s.minimoalerta, AvailabilityName = a.Name })
            .FirstOrDefaultAsync();

        if (updatedStock is not null)
        {
            existing.StockQuantity = updatedStock.quantidade;
            existing.MinimoAlerta = updatedStock.minimoalerta;
            existing.Availability = updatedStock.AvailabilityName;
        }
        else
        {
            existing.Availability = "Fora de Estoque";
        }

        if (await _context.CategoryProducts.FindAsync(existing.CategoryProductId) is { } category)
        {
            existing.CategoryName = category.Name;
        }

        return Ok(existing);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteProduct(Guid id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product is null) return NotFound();

        var stock = await _context.Stocks.FirstOrDefaultAsync(s => s.produtoid == id);
        if (stock is not null)
        {
            _context.Stocks.Remove(stock);
        }

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}