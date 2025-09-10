using System;
using System.ComponentModel.DataAnnotations;

namespace back_tcc.Models
{
    public class Pedido
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid ComandaId { get; set; }

        [Required]
        public Guid ProdutoId { get; set; }

        [Required]
        public int Quantidade { get; set; }

        [Required]
        public decimal PrecoUnit { get; set; }

        public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    }
}
