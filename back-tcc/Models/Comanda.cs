using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace back_tcc.Models
{
    [Table("comanda")]
    public class Comanda
    {
        [Key]
        public Guid id { get; set; }

        [Required]
        public string tipo { get; set; } = string.Empty; // Mesa, Balcao, Entrega

        [Required]
        public string status { get; set; } = "Aberta"; // Aberta, Fechada, Aguardando Pagamento

        public int? mesanum { get; set; }

        public DateTime criadoem { get; set; } = DateTime.UtcNow;

        public DateTime? fechadoem { get; set; }

        public Guid criadopor { get; set; }

        public List<Pedido> pedidos { get; set; } = new();
    }
}
