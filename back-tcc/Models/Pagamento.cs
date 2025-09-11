using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace back_tcc.Models
{
    [Table("pagamento")]
    public class Pagamento
    {
        [Key]
        public Guid id { get; set; }

        [Required]
        public Guid comandaid { get; set; }

        [Required]
        public decimal valorpago { get; set; }

        [Required]
        public string metodo { get; set; } = string.Empty; // Dinheiro, PIX, CartaoCredito, CartaoDebito

        public DateTime pagamentoem { get; set; } = DateTime.UtcNow;

        public Guid? subcomandaid { get; set; }
    }
}
