using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using back_tcc.Data;
using back_tcc.Models;

namespace back_tcc.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsuariosController(ApplicationDbContext context) : ControllerBase
{
    private readonly ApplicationDbContext _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Usuario>>> GetUsuarios()
    {
        return await _context.Usuarios.ToListAsync();
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Usuario>> GetUsuario(Guid id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        return usuario is null ? NotFound() : usuario;
    }

    [HttpPost]
    public async Task<ActionResult<Usuario>> PostUsuario(Usuario usuario)
    {
        var cargo = await _context.CargosUsuario.FindAsync(usuario.cargoid);
        if (cargo is null) return BadRequest("Cargo inválido");

        usuario.tipo = cargo.nome;
        usuario.criadoem = DateTime.UtcNow;
        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetUsuario), new { id = usuario.id }, usuario);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> PutUsuario(Guid id, Usuario usuario)
    {
        if (id != usuario.id) return BadRequest();

        var cargo = await _context.CargosUsuario.FindAsync(usuario.cargoid);
        if (cargo is null) return BadRequest("Cargo inválido");

        var existing = await _context.Usuarios.FindAsync(id);
        if (existing is null) return NotFound();

        existing.nome = usuario.nome;
        existing.cpf = usuario.cpf;
        existing.cargoid = usuario.cargoid;
        existing.tipo = cargo.nome;
        existing.status = usuario.status;
        if (!string.IsNullOrEmpty(usuario.senha))
        {
            existing.senha = usuario.senha;
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteUsuario(Guid id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario is null) return NotFound();
        _context.Usuarios.Remove(usuario);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}