using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace back_tcc.Models;

[Table("categoriaproduto")]
public class CategoryProduct
{
    [Key]
    public Guid id { get; set; }

    [Column("nome"), Required]
    public string Name { get; set; } = string.Empty;
}