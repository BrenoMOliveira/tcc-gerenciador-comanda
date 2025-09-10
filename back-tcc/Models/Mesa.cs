using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace back_tcc.Models
{
    [Table("mesa")]
    public class Mesa
    {
        [Key]
        public Guid id { get; set; }

        public int numero { get; set; }

        [Required]
        public string status { get; set; } = "Livre";

        public DateTime criadoem { get; set; } = DateTime.UtcNow;

        [System.ComponentModel.DataAnnotations.Schema.NotMapped]
        public Guid? comandaid { get; set; }

        [System.ComponentModel.DataAnnotations.Schema.NotMapped]
        public Comanda? comanda { get; set; }
    }
}
