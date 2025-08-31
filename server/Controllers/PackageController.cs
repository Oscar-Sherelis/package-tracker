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
        private readonly ILogger<PackageController> _logger;

        public PackageController(IPackageService packageService, ILogger<PackageController> logger)
        {
            _packageService = packageService;
            _logger = logger;
        }

        // GET: api/package
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PackageDto>>> GetAll(
            [FromQuery] string? searchTerm,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10
        )
        {
            // Validate pagination parameters
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 50) pageSize = 10; // Smaller limit for in-memory

            try
            {
                var packages = await _packageService.GetAllAsync(searchTerm, page, pageSize);
                var totalCount = await _packageService.GetCountAsync(searchTerm);
                var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

                // For in-memory, we might want to limit large result sets
                if (totalCount > 1000)
                {
                    _logger.LogWarning("Large dataset query: {Count} packages", totalCount);
                }

                return Ok(new
                {
                    Packages = packages,
                    TotalCount = totalCount,
                    TotalPages = totalPages,
                    CurrentPage = page,
                    PageSize = pageSize,
                    HasNext = page < totalPages,
                    HasPrevious = page > 1
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching packages with search: {searchTerm}", searchTerm);
                return StatusCode(500, "Internal server error");
            }
        }

        // GET: api/package/{id}
        [HttpGet("{id:guid}")]
        public async Task<ActionResult<PackageDto>> GetById(Guid id)
        {
            try
            {
                var package = await _packageService.GetByIdAsync(id);
                if (package == null)
                {
                    _logger.LogWarning("Package not found: {PackageId}", id);
                    return NotFound();
                }
                return Ok(package);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching package: {PackageId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        // POST: api/package
        [HttpPost]
        public async Task<ActionResult<PackageDto>> Create([FromBody] Package package)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state for package creation");
                return BadRequest(ModelState);
            }

            try
            {
                var created = await _packageService.CreateAsync(package);
                _logger.LogInformation("Package created: {PackageId}", created.Id);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating package");
                return StatusCode(500, "Internal server error");
            }
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
