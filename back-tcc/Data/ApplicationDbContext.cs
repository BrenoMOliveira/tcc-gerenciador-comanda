using Microsoft.EntityFrameworkCore;
using back_tcc.Models;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

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

    public override int SaveChanges()
    {
        NormalizeTrackedNames();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        NormalizeTrackedNames();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void NormalizeTrackedNames()
    {
        foreach (var entry in ChangeTracker.Entries<Product>()
                     .Where(e => e.State is EntityState.Added or EntityState.Modified))
        {
            entry.Entity.Name = Normalize(entry.Entity.Name);
        }

        foreach (var entry in ChangeTracker.Entries<CategoryProduct>()
                     .Where(e => e.State is EntityState.Added or EntityState.Modified))
        {
            entry.Entity.Name = Normalize(entry.Entity.Name);
        }
    }

    private static string Normalize(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return string.Empty;
        }

        var trimmed = value.Trim();
        if (trimmed.Length == 0)
        {
            return string.Empty;
        }

        var first = trimmed[..1].ToUpper(CultureInfo.CurrentCulture);
        var rest = trimmed[1..].ToLower(CultureInfo.CurrentCulture);
        return first + rest;
    }
}
