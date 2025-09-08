using System.ComponentModel.DataAnnotations;

namespace back_tcc.Models;

public enum ProductAvailability
{
    EmEstoque,
    BaixoEstoque,
    ForaDeEstoque
}

public class Product
{
    public int Id { get; set; }

    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string Category { get; set; } = string.Empty;

    [Range(0, double.MaxValue)]
    public decimal Price { get; set; }

    [Range(0, int.MaxValue)]
    public int StockQuantity { get; set; }

    public ProductAvailability Availability { get; set; }
}
