using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

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

    [Column("categoriaid"), Required]
    public Guid CategoryProductId { get; set; }

    [NotMapped]
    [JsonPropertyName("category")]
    public string CategoryName { get; set; } = string.Empty;

    [Column("preco"), Range(0, double.MaxValue)]
    public decimal Price { get; set; }

    [Column("ativo")]
    public bool Ativo { get; set; } = true;

    [NotMapped]
    public int StockQuantity { get; set; }

    [NotMapped]
    public int MinimoAlerta { get; set; }

    [NotMapped]
    public string Availability { get; set; } = string.Empty;
}
