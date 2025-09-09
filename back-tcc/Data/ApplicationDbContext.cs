using Microsoft.EntityFrameworkCore;
using back_tcc.Models;

namespace back_tcc.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
  : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Stock> Stocks => Set<Stock>();
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<CargoUsuario> CargosUsuario => Set<CargoUsuario>();
    public DbSet<CategoryProduct> CategoryProducts => Set<CategoryProduct>();
    public DbSet<AvailabilityProduct> AvailabilityProducts => Set<AvailabilityProduct>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Stock>().Property(s => s.disponibilidadeid).HasColumnName("disponibilidadeid");
    }

}