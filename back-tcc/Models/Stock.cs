using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace back_tcc.Models;

[Table("estoque")]
public class Stock
{
    [Key]
    public Guid id { get; set; }

    public Guid produtoid { get; set; }

    public int quantidade { get; set; }

    public int minimoalerta { get; set; }

    [Column("disponibilidadeid")]
    public int disponibilidadeid { get; set; }

    public DateTime atualizadoem { get; set; }
}
