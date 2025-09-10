using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using back_tcc.Data;
using back_tcc.Models;

namespace back_tcc.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
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

        if (usuario.senha is null || usuario.senha.Length < 8)
            return BadRequest("A senha deve ter no mínimo 8 caracteres");

        if (await _context.Usuarios.AnyAsync(u => u.cpf == usuario.cpf))
            return Conflict("CPF já cadastrado");

        usuario.tipo = cargo.nome;
        usuario.criadoem = DateTime.UtcNow;
        usuario.senha = BCrypt.Net.BCrypt.HashPassword(usuario.senha);
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
        if (existing.cpf != usuario.cpf)
        {
            if (await _context.Usuarios.AnyAsync(u => u.cpf == usuario.cpf && u.id != id))
                return Conflict("CPF já cadastrado");
            existing.cpf = usuario.cpf;
        }
        existing.cargoid = usuario.cargoid;
        existing.tipo = cargo.nome;
        existing.status = usuario.status;
        if (!string.IsNullOrWhiteSpace(usuario.senha))
        {
            if (usuario.senha.Length < 8)
                return BadRequest("Senha deve ter no mínimo 8 caracteres");
            existing.senha = BCrypt.Net.BCrypt.HashPassword(usuario.senha);
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