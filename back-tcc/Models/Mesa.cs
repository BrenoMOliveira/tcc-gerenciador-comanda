using System;
using System.ComponentModel.DataAnnotations;

namespace back_tcc.Models
{
    public class Mesa
    {
        [Key]
        public Guid Id { get; set; }

        public int Numero { get; set; }

        [Required]
        public string Status { get; set; } = "Livre";

        public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

        [System.ComponentModel.DataAnnotations.Schema.NotMapped]
        public Guid? ComandaId { get; set; }
    }
}
