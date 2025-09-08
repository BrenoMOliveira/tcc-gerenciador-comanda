using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace back_tcc.Models;

[Table("Estoque")]
public class Stock
{
    [Key]
    public Guid Id { get; set; }

    public Guid ProdutoId { get; set; }

    public int Quantidade { get; set; }

    public int MinimoAlerta { get; set; }

    public DateTime AtualizadoEm { get; set; }
}
