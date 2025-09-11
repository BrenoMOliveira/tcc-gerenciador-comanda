using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using back_tcc.Data;

namespace back_tcc.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(ApplicationDbContext context, IConfiguration configuration) : ControllerBase
{
    private readonly ApplicationDbContext _context = context;
    private readonly IConfiguration _config = configuration;

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var usuario = await _context.Usuarios.SingleOrDefaultAsync(u => u.cpf == request.cpf);
        if (usuario is null) return Unauthorized();

        if (!BCrypt.Net.BCrypt.Verify(request.senha, usuario.senha))
            return Unauthorized();

        var handler = new JwtSecurityTokenHandler();
        var key = Convert.FromBase64String(_config["JWT_KEY"]!);

        var descriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[] { new Claim("id", usuario.id.ToString()) }),
            Expires = DateTime.UtcNow.AddMinutes(_config.GetValue<int>("Jwt:ExpiresInMinutes")),
            Issuer = _config["Jwt:Issuer"],
            Audience = _config["Jwt:Audience"],
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256)
        };

        var token = handler.CreateToken(descriptor);
        var jwt = handler.WriteToken(token);

        return Ok(new { token = jwt });
    }
}

public record LoginRequest(string cpf, string senha);