using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace back_tcc.Models;

[Table("disponibilidadeproduto")]
public class AvailabilityProduct
{
    [Key]
    public int id { get; set; }

    [Column("nome"), Required]
    public string Name { get; set; } = string.Empty;
}