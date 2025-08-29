using Microsoft.AspNetCore.Mvc;
using Server.Models;
using Server.Models.Enums;
using Server.Services;
using Server.DTO;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PackageController : ControllerBase
    {
        private readonly IPackageService _packageService;

        public PackageController(IPackageService packageService)
        {
            _packageService = packageService;
        }

        // GET: api/package
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PackageDto>>> GetAll()

        {
            var packages = await _packageService.GetAllAsync();
            return Ok(packages);
        }

        // GET: api/package/{id}
        [HttpGet("{id:guid}")]
        public async Task<ActionResult<PackageDto>> GetById(Guid id)
        {
            var package = await _packageService.GetByIdAsync(id);
            if (package == null) return NotFound();
            return Ok(package);
        }

        // POST: api/package
        [HttpPost]
        public async Task<ActionResult<PackageDto>> Create([FromBody] Package package)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var created = await _packageService.CreateAsync(package);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        public class UpdateStatusRequest
        {
            public PackageStatus NewStatus { get; set; }
        }

        // PUT: api/package/{id}/status
        [HttpPut("{id:guid}/status")]
        public async Task<ActionResult<PackageDto>> UpdateStatus(Guid id, [FromBody] UpdateStatusRequest request)
        {
            try
            {
                var updated = await _packageService.UpdateStatusAsync(id, request.NewStatus);
                if (updated == null) return NotFound();

                return Ok(updated);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
