using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace back_tcc.Models
{
    public class Comanda
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public string Tipo { get; set; } = string.Empty; // Mesa, Balcao, Entrega

        [Required]
        public string Status { get; set; } = "Aberta"; // Aberta, Fechada, Aguardando Pagamento

        public int? MesaNum { get; set; }

        public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

        public DateTime? FechadoEm { get; set; }

        public Guid CriadoPor { get; set; }

        public List<Pedido> Pedidos { get; set; } = new();
    }
}
