using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using serviceworker.Models;

namespace serviceworker.Controllers
{
    public class HomeController : Controller
    {
        private static int _id = 0;

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult About()
        {
            ViewData["Message"] = "Your application description page.";

            return View();
        }

        public IActionResult Contact()
        {
            ViewData["Message"] = "Your contact page.";

            return View();
        }

        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

        public IActionResult StaticJsonData()
        {
            var data = new { hello = "world" };
            return Json(data);
        }

        public IActionResult JsonData(string id)
        {
            var data = new
            {
                JsonDataId = id + _id.ToString()
            };

            _id++;

            return Json(data);
        }
    }
}
