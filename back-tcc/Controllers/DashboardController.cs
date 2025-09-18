using back_tcc.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace back_tcc.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController(ApplicationDbContext context) : ControllerBase
{
    private readonly ApplicationDbContext _context = context;

    private static readonly string[] ClosedStatuses = ["Fechada", "Paga"];

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

        var lastDayQuery = _context.Comanda
            .Where(c => ClosedStatuses.Contains(c.status) && c.fechadoem != null)
            .Where(c => c.fechadoem >= start && c.fechadoem < now);

        var lastDaySales = await lastDayQuery.CountAsync();

        var lastDayPayments = await _context.Pagamentos
            .Where(p => p.pagoem >= start && p.pagoem < now)
            .Where(p => lastDayQuery.Select(c => c.id).Contains(p.comandaid))
            .SumAsync(p => (decimal?)p.valorpago) ?? 0m;

        var previousQuery = _context.Comanda
            .Where(c => ClosedStatuses.Contains(c.status) && c.fechadoem != null)
            .Where(c => c.fechadoem >= previousStart && c.fechadoem < start);

        var previousSales = await previousQuery.CountAsync();

        var previousPayments = await _context.Pagamentos
            .Where(p => p.pagoem >= previousStart && p.pagoem < start)
            .Where(p => previousQuery.Select(c => c.id).Contains(p.comandaid))
            .SumAsync(p => (decimal?)p.valorpago) ?? 0m;

        var salesChange = CalculatePercentageChange(lastDaySales, previousSales);
        var valueChange = CalculatePercentageChange(lastDayPayments, previousPayments);

        return new LastDaySalesResponse(lastDaySales, lastDayPayments, salesChange, valueChange);
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
    public async Task<ActionResult<CashFlowSeriesResponse>> GetCashFlowTrendAsync([FromQuery] int days = 7)
    {
        if (days != 7 && days != 30)
        {
            return BadRequest("O parâmetro days deve ser 7 ou 30.");
        }

        var now = DateTime.UtcNow;
        var startDate = now.Date.AddDays(-(days - 1));

        var grouped = await _context.Pagamentos
            .Where(p => p.pagoem >= startDate && p.pagoem < now)
            .GroupBy(p => p.pagoem.Date)
            .Select(g => new { g.Key, Total = g.Sum(p => p.valorpago) })
            .ToListAsync();

        var lookup = grouped.ToDictionary(x => x.Key, x => x.Total);
        var points = new List<CashFlowPointDto>(capacity: days);

        for (var i = 0; i < days; i++)
        {
            var date = startDate.AddDays(i);
            lookup.TryGetValue(date, out var total);
            var normalizedDate = DateTime.SpecifyKind(date, DateTimeKind.Utc);
            points.Add(new CashFlowPointDto(normalizedDate, total));
        }

        return new CashFlowSeriesResponse(days, points);
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

    public record CashFlowSeriesResponse(int Days, IReadOnlyList<CashFlowPointDto> Points);
}