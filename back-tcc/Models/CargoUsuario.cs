using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace back_tcc.Models;

[Table("cargousuario")]
public class CargoUsuario
{
    [Key]
    [Column("id")]
    public short id { get; set; }

    [Column("nome"), Required]
    public string nome { get; set; } = string.Empty;
}