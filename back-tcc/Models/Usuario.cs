using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace back_tcc.Models;

[Table("usuario")]
public class Usuario
{
    [Key]
    public Guid id { get; set; }

    [Column("nome"), Required]
    public string nome { get; set; } = string.Empty;

    [Column("cpf"), Required, StringLength(14)]
    public string cpf { get; set; } = string.Empty;

    [Column("senha"), Required]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public string senha { get; set; } = string.Empty;

    [Column("tipo"), Required]
    public string tipo { get; set; } = string.Empty;

    [Column("cargoid"), Required]
    public short cargoid { get; set; }

    [Column("status")]
    public short status { get; set; } = 1;

    [Column("criadoem")]
    public DateTime criadoem { get; set; }
}