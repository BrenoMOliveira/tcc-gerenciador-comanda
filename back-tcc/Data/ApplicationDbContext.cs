using Microsoft.EntityFrameworkCore;
using back_tcc.Models;

namespace back_tcc.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();
}
