using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace back_tcc.Models
{
    [Table("pedido")]
    public class Pedido
    {
        [Key]
        public Guid id { get; set; }

        [Required]
        public Guid comandaid { get; set; }

        [Required]
        public Guid produtoid { get; set; }

        [Required]
        public int quantidade { get; set; }

        [Required]
        public decimal precounit { get; set; }

        public DateTime criadoem { get; set; } = DateTime.UtcNow;
    }
}
