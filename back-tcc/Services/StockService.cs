using System.Collections.Concurrent;
using back_tcc.Data;
using back_tcc.Models;
using Microsoft.EntityFrameworkCore;

namespace back_tcc.Services;

public record StockItemRequest(Guid ProductId, int Quantity);

public record StockCheckResult(bool Success, string? Message = null);

public interface IStockService
{
    Task<StockCheckResult> CheckStockAsync(IEnumerable<StockItemRequest> items, CancellationToken cancellationToken = default);
    Task DecreaseStockAsync(IEnumerable<StockItemRequest> items, CancellationToken cancellationToken = default);
}

public class StockService(ApplicationDbContext context) : IStockService
{
    private readonly ApplicationDbContext _context = context;
    private readonly ConcurrentDictionary<string, int> _availabilityCache = new(StringComparer.OrdinalIgnoreCase);

    public async Task<StockCheckResult> CheckStockAsync(IEnumerable<StockItemRequest> items, CancellationToken cancellationToken = default)
    {
        var groupedItems = items
            ?.Where(i => i.Quantity > 0)
            .GroupBy(i => i.ProductId)
            .Select(g => new StockItemRequest(g.Key, g.Sum(x => x.Quantity)))
            .ToList() ?? [];

        if (groupedItems.Count == 0)
        {
            return new StockCheckResult(true);
        }

        var productIds = groupedItems.Select(g => g.ProductId).ToList();

        var stocks = await _context.Stocks
            .AsNoTracking()
            .Where(s => productIds.Contains(s.produtoid))
            .ToDictionaryAsync(s => s.produtoid, cancellationToken);

        var products = await _context.Products
            .AsNoTracking()
            .Where(p => productIds.Contains(p.id))
            .ToDictionaryAsync(p => p.id, cancellationToken);

        foreach (var item in groupedItems)
        {
            stocks.TryGetValue(item.ProductId, out var stock);
            var available = stock?.quantidade ?? 0;
            if (available < item.Quantity)
            {
                var missing = item.Quantity - available;
                var productName = products.TryGetValue(item.ProductId, out var product)
                    ? product.Name
                    : item.ProductId.ToString();
                var unitLabel = missing == 1 ? "unidade" : "unidades";
                var message = $"Produto \"{productName}\" sem estoque suficiente. Faltam {missing} {unitLabel}.";
                return new StockCheckResult(false, message);
            }
        }

        return new StockCheckResult(true);
    }

    public async Task DecreaseStockAsync(IEnumerable<StockItemRequest> items, CancellationToken cancellationToken = default)
    {
        var groupedItems = items
            ?.Where(i => i.Quantity > 0)
            .GroupBy(i => i.ProductId)
            .Select(g => new StockItemRequest(g.Key, g.Sum(x => x.Quantity)))
            .ToList() ?? [];

        if (groupedItems.Count == 0)
        {
            return;
        }

        var productIds = groupedItems.Select(g => g.ProductId).ToList();

        var stocks = await _context.Stocks
            .Where(s => productIds.Contains(s.produtoid))
            .ToDictionaryAsync(s => s.produtoid, cancellationToken);

        foreach (var item in groupedItems)
        {
            if (!stocks.TryGetValue(item.ProductId, out var stock))
            {
                continue;
            }

            stock.quantidade = Math.Max(0, stock.quantidade - item.Quantity);
            stock.atualizadoem = DateTime.UtcNow;
            stock.disponibilidadeid = await ResolveAvailabilityIdAsync(stock.quantidade, stock.minimoalerta, cancellationToken);
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    private async Task<int> ResolveAvailabilityIdAsync(int quantity, int minAlert, CancellationToken cancellationToken)
    {
        var statusName = quantity <= 0
            ? "Fora de Estoque"
            : quantity <= minAlert
                ? "Baixo Estoque"
                : "Em Estoque";

        if (_availabilityCache.TryGetValue(statusName, out var cachedId))
        {
            return cachedId;
        }

        var availability = await _context.AvailabilityProducts
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Name == statusName, cancellationToken);

        if (availability is null)
        {
            throw new InvalidOperationException($"Disponibilidade '{statusName}' não encontrada no cadastro.");
        }

        _availabilityCache.TryAdd(statusName, availability.id);
        return availability.id;
    }
}
