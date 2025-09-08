using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace back_tcc.Models;

public enum ProductAvailability
{
    EmEstoque,
    BaixoEstoque,
    ForaDeEstoque
}

[Table("produto")]
public class Product
{
    [Key]
    public Guid id { get; set; }

    [Column("nome"), Required]
    public string Name { get; set; } = string.Empty;

    [Column("categoria"), Required]
    public string Category { get; set; } = string.Empty;

    [Column("preco"), Range(0, double.MaxValue)]
    public decimal Price { get; set; }

    [Column("ativo")]
    public bool Ativo { get; set; } = true;

    [NotMapped]
    public int StockQuantity { get; set; }

    [NotMapped]
    public ProductAvailability Availability { get; set; }
}
