using back_tcc.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace back_tcc.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController(ApplicationDbContext context) : ControllerBase
{
    private readonly ApplicationDbContext _context = context;

    private static readonly HashSet<string> ClosedStatuses =
    new(["Fechada", "Paga"], StringComparer.OrdinalIgnoreCase);

    // TODO: Replace this mock when the dedicated expenses module is available.
    private const decimal ExpensesMockValue = 8155.00m;

    [HttpGet("critical-stock")]
    public async Task<ActionResult<IEnumerable<CriticalStockItemDto>>> GetCriticalStockAsync()
    {
        var criticalProducts = await (from stock in _context.Stocks
                                      join product in _context.Products on stock.produtoid equals product.id
                                      join category in _context.CategoryProducts on product.CategoryProductId equals category.id
                                      where product.Ativo &&
                                            (stock.quantidade == 0 ||
                                             (stock.quantidade <= stock.minimoalerta && stock.quantidade > 0))
                                      orderby stock.quantidade == 0 ? 0 : 1, stock.quantidade, product.Name
                                      select new CriticalStockItemDto(
                                          product.id,
                                          product.Name,
                                          category.Name,
                                          stock.quantidade,
                                          stock.quantidade == 0 ? "Fora de Estoque" : "Baixo Estoque")
                                      ).ToListAsync();

        return criticalProducts;
    }

    [HttpGet("sales/last-day")]
    public async Task<ActionResult<LastDaySalesResponse>> GetLastDaySalesAsync()
    {
        var now = DateTime.UtcNow;
        var start = now.AddDays(-1);
        var previousStart = start.AddDays(-1);

        var currentMetrics = await CalculateClosedSalesMetricsAsync(start, now);
        var previousMetrics = await CalculateClosedSalesMetricsAsync(previousStart, start);

        var salesChange = CalculatePercentageChange(currentMetrics.TotalOrders, previousMetrics.TotalOrders);
        var valueChange = CalculatePercentageChange(currentMetrics.TotalValue, previousMetrics.TotalValue);

        return new LastDaySalesResponse(
            currentMetrics.TotalOrders,
            currentMetrics.TotalValue,
            salesChange,
            valueChange);
    }

    [HttpGet("financial-summary")]
    public async Task<ActionResult<FinancialSummaryResponse>> GetFinancialSummaryAsync([FromQuery] int comparisonPeriodDays = 7)
    {
        if (comparisonPeriodDays != 7 && comparisonPeriodDays != 30)
        {
            comparisonPeriodDays = 7;
        }

        var now = DateTime.UtcNow;
        var periodStart = now.AddDays(-comparisonPeriodDays);
        var previousPeriodStart = periodStart.AddDays(-comparisonPeriodDays);

        var totalRevenue = await _context.Pagamentos.SumAsync(p => (decimal?)p.valorpago) ?? 0m;

        var currentRevenuePeriod = await _context.Pagamentos
            .Where(p => p.pagoem >= periodStart && p.pagoem < now)
            .SumAsync(p => (decimal?)p.valorpago) ?? 0m;

        var previousRevenuePeriod = await _context.Pagamentos
            .Where(p => p.pagoem >= previousPeriodStart && p.pagoem < periodStart)
            .SumAsync(p => (decimal?)p.valorpago) ?? 0m;

        var revenueVariation = CalculatePercentageChange(currentRevenuePeriod, previousRevenuePeriod);

        var expenseValue = ExpensesMockValue;
        var expenseRatio = totalRevenue > 0 ? expenseValue / totalRevenue : 0m;

        var currentExpensePeriod = currentRevenuePeriod * expenseRatio;
        var previousExpensePeriod = previousRevenuePeriod * expenseRatio;

        var currentProfitPeriod = currentRevenuePeriod - currentExpensePeriod;
        var previousProfitPeriod = previousRevenuePeriod - previousExpensePeriod;

        var profitVariation = totalRevenue > 0
            ? CalculatePercentageChange(currentProfitPeriod, previousProfitPeriod)
            : 0m;

        var netProfitValue = totalRevenue - expenseValue;

        var response = new FinancialSummaryResponse(
            new FinancialMetricDto(totalRevenue, revenueVariation),
            new FinancialMetricDto(totalRevenue, revenueVariation),
            new FinancialMetricDto(expenseValue, 0m, true),
            new FinancialMetricDto(netProfitValue, profitVariation),
            comparisonPeriodDays
        );

        return response;
    }

    [HttpGet("cashflow-trend")]
    public async Task<ActionResult<CashFlowSeriesResponse>> GetCashFlowTrendAsync([FromQuery(Name = "periodo")] int periodDays = 7)
    {
        var validPeriods = new HashSet<int> { 7, 15, 30 };
        if (!validPeriods.Contains(periodDays))
        {
            return BadRequest("O parâmetro periodo deve ser 7, 15 ou 30.");
        }

        var now = DateTime.UtcNow;
        var startDate = now.Date.AddDays(-(periodDays - 1));
        var previousPeriodEnd = startDate;
        var previousPeriodStart = previousPeriodEnd.AddDays(-periodDays);

        var paymentsQuery = _context.Pagamentos.AsNoTracking();

        var grouped = await paymentsQuery
            .Where(p => p.pagoem >= startDate && p.pagoem < now)
            .GroupBy(p => p.pagoem.Date)
            .Select(g => new { Date = g.Key, Total = g.Sum(p => p.valorpago) })
            .ToListAsync();

        var totalCollected = grouped.Sum(x => x.Total);

        var lookup = grouped.ToDictionary(x => x.Date, x => x.Total);
        var points = new List<CashFlowPointDto>(capacity: periodDays);

        for (var i = 0; i < periodDays; i++)
        {
            var date = startDate.AddDays(i);
            lookup.TryGetValue(date, out var total);
            var normalizedDate = DateTime.SpecifyKind(date, DateTimeKind.Utc);
            points.Add(new CashFlowPointDto(normalizedDate, total));
        }

        var previousPeriodTotal = await paymentsQuery
            .Where(p => p.pagoem >= previousPeriodStart && p.pagoem < previousPeriodEnd)
            .SumAsync(p => (decimal?)p.valorpago) ?? 0m;

        var variation = CalculatePercentageChange(totalCollected, previousPeriodTotal);

        return new CashFlowSeriesResponse(periodDays, totalCollected, variation, points);
    }

    private static decimal CalculatePercentageChange(decimal current, decimal previous)
    {
        if (previous == 0)
        {
            if (current == 0)
            {
                return 0;
            }

            return current > 0 ? 100 : -100;
        }

        var difference = current - previous;
        var denominator = Math.Abs(previous);
        var change = difference / denominator * 100;
        return Math.Round(change, 2, MidpointRounding.AwayFromZero);
    }

    public record CriticalStockItemDto(
        Guid ProductId,
        string Product,
        string Category,
        int Quantity,
        string Status);

    public record LastDaySalesResponse(
        int TotalOrders,
        decimal TotalValue,
        decimal TotalOrdersChange,
        decimal TotalValueChange);

    public record FinancialMetricDto(decimal Value, decimal Variation, bool IsMock = false);

    public record FinancialSummaryResponse(
        FinancialMetricDto CashFlow,
        FinancialMetricDto TotalRevenue,
        FinancialMetricDto Expenses,
        FinancialMetricDto NetProfit,
        int ComparisonPeriodDays);

    public record CashFlowPointDto(DateTime Date, decimal Value);

    public record CashFlowSeriesResponse(int PeriodDays, decimal TotalValue, decimal Variation, IReadOnlyList<CashFlowPointDto> Points);

    private sealed record SalesPeriodMetrics(int TotalOrders, decimal TotalValue);

    private async Task<SalesPeriodMetrics> CalculateClosedSalesMetricsAsync(DateTime start, DateTime end)
    {
        var closedComandas = await _context.Comanda
            .AsNoTracking()
            .Where(c => c.status != null && ClosedStatuses.Contains(c.status))
            .Select(c => new
            {
                c.id,
                ClosedAt = c.fechadoem ?? c.pagamentos
                    .OrderByDescending(p => p.pagoem)
                    .Select(p => (DateTime?)p.pagoem)
                    .FirstOrDefault()
            })
            .Where(c => c.ClosedAt.HasValue && c.ClosedAt.Value >= start && c.ClosedAt.Value < end)
            .Select(c => c.id)
            .ToListAsync();

        var closedSubComandas = await _context.SubComandas
            .AsNoTracking()
            .Where(s => s.status != null && ClosedStatuses.Contains(s.status))
            .Select(s => new
            {
                s.id,
                ClosedAt = s.pagamentos
                    .OrderByDescending(p => p.pagoem)
                    .Select(p => (DateTime?)p.pagoem)
                    .FirstOrDefault()
            })
            .Where(s => s.ClosedAt.HasValue && s.ClosedAt.Value >= start && s.ClosedAt.Value < end)
            .Select(s => s.id)
            .ToListAsync();

        decimal totalValue = 0m;

        if (closedComandas.Count > 0)
        {
            totalValue += await _context.Pagamentos
                .AsNoTracking()
                .Where(p => p.subcomandaid == null)
                .Where(p => p.pagoem >= start && p.pagoem < end)
                .Where(p => closedComandas.Contains(p.comandaid))
                .SumAsync(p => (decimal?)p.valorpago) ?? 0m;
        }

        if (closedSubComandas.Count > 0)
        {
            totalValue += await _context.Pagamentos
                .AsNoTracking()
                .Where(p => p.subcomandaid != null)
                .Where(p => p.pagoem >= start && p.pagoem < end)
                .Where(p => closedSubComandas.Contains(p.subcomandaid!.Value))
                .SumAsync(p => (decimal?)p.valorpago) ?? 0m;
        }

        var totalOrders = closedComandas.Count + closedSubComandas.Count;

        return new SalesPeriodMetrics(totalOrders, totalValue);
    }
}