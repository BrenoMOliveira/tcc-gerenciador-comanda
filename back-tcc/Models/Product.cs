using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace back_tcc.Models;

public enum ProductAvailability
{
    EmEstoque,
    BaixoEstoque,
    ForaDeEstoque
}

[Table("Produto")]
public class Product
{
    [Key]
    public Guid Id { get; set; }

    [Column("Nome"), Required]
    public string Name { get; set; } = string.Empty;

    [Column("Categoria"), Required]
    public string Category { get; set; } = string.Empty;

    [Column("Preco"), Range(0, double.MaxValue)]
    public decimal Price { get; set; }

    [Column("Ativo")]
    public bool Ativo { get; set; } = true;

    [NotMapped]
    public int StockQuantity { get; set; }

    [NotMapped]
    public ProductAvailability Availability { get; set; }
}
