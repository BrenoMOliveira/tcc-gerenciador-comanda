using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace back_tcc.Models
{
    [Table("subcomanda")]
    public class SubComanda
    {
        [Key]
        public Guid id { get; set; }

        [Required]
        public Guid comandaid { get; set; }

        public Guid? clienteid { get; set; }

        [Column("nome_cliente")]
        public string? nomeCliente { get; set; }

        [Required]
        public string status { get; set; } = "Aberta";

        public DateTime criadoem { get; set; } = DateTime.UtcNow;

        public List<Pedido> pedidos { get; set; } = new();

        public List<Pagamento> pagamentos { get; set; } = new();
    }
}