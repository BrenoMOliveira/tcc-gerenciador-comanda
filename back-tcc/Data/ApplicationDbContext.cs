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
    public DbSet<Mesa> Mesas => Set<Mesa>();
    public DbSet<Comanda> Comanda => Set<Comanda>();
    public DbSet<Pedido> Pedidos => Set<Pedido>();
    public DbSet<Pagamento> Pagamentos => Set<Pagamento>();
    public DbSet<SubComanda> SubComandas => Set<SubComanda>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Stock>().Property(s => s.disponibilidadeid).HasColumnName("disponibilidadeid");
    }

}