(function () {
  function getByPath(obj, path) {
    return path.split(".").reduce(function (acc, key) {
      if (acc == null) return undefined;
      return acc[key];
    }, obj);
  }

  function setText(el, value) {
    if (value == null) return;
    el.textContent = String(value);
  }

  function bindScalars(content) {
    document.querySelectorAll("[data-content]").forEach(function (el) {
      var path = el.getAttribute("data-content");
      if (!path) return;
      var value = getByPath(content, path);
      if (value == null || typeof value === "object") return;
      setText(el, value);
    });

    // 2. NEW: HTML/SVG content binder
    document.querySelectorAll("[data-content-html]").forEach(function (el) {
      var path = el.getAttribute("data-content-html");
      if (!path) return;
      var value = getByPath(content, path);
      if (value == null || typeof value === "object") return;
      
      try {
        // Create a virtual DOM parser to safely process the SVG layout
        var parser = new DOMParser();
        var doc = parser.parseFromString(value, "image/svg+xml");
        var svgElement = doc.querySelector("svg");
        
        if (svgElement) {
          // Clear old structural text fallback and append the live SVG element node
          el.innerHTML = "";
          el.appendChild(svgElement);
        } else {
          // Fallback to standard innerHTML string injection if no SVG object is found
          el.innerHTML = value;
        }
      } catch (e) {
        // Final backup string injection block
        el.innerHTML = value;
      }
    });

    document.querySelectorAll("[data-content-href]").forEach(function (el) {
      var path = el.getAttribute("data-content-href");
      if (!path) return;
      var value = getByPath(content, path);
      if (value == null) return;
      var prefix = el.getAttribute("data-content-prefix") || "";
      var href = String(value);
      if (prefix === "mailto:" && href.indexOf("mailto:") !== 0) {
        href = "mailto:" + href;
      } else if (prefix && href.indexOf(prefix) !== 0) {
        href = prefix + href;
      }
      el.setAttribute("href", href);
    });

    document.querySelectorAll("[data-content-aria]").forEach(function (el) {
      var path = el.getAttribute("data-content-aria");
      if (!path) return;
      var value = getByPath(content, path);
      if (value == null) return;
      el.setAttribute("aria-label", String(value));
    });
  }

  function bindMeta(content) {
    if (!content.meta) return;
    if (content.meta.title) document.title = content.meta.title;
    var desc = document.querySelector('meta[name="description"]');
    if (desc && content.meta.description) {
      desc.setAttribute("content", content.meta.description);
    }
  }

  function bindOutcomes(content) {
    var list = document.querySelector('[data-content-list="outcomes"]');
    var items = content.outcomes && content.outcomes.items;
    if (!list || !Array.isArray(items)) return;
    list.innerHTML = "";
    items.forEach(function (item) {
      var li = document.createElement("li");
      var strong = document.createElement("strong");
      strong.textContent = item.title || "";
      var span = document.createElement("span");
      span.textContent = item.body || "";
      li.appendChild(strong);
      li.appendChild(span);
      list.appendChild(li);
    });
  }

  function bindCraft(content) {
    var list = document.querySelector('[data-content-list="craft"]');
    var items = content.craft && content.craft.items;
    if (!list || !Array.isArray(items)) return;
    list.innerHTML = "";
    items.forEach(function (item) {
      var li = document.createElement("li");
      var strong = document.createElement("strong");
      strong.textContent = item.title || "";
      li.appendChild(strong);
      li.appendChild(document.createTextNode(item.body || ""));
      list.appendChild(li);
    });
  }

  function bindSteps(content) {
    var list = document.querySelector('[data-content-list="steps"]');
    var steps = content.how && content.how.steps;
    if (!list || !Array.isArray(steps)) return;
    list.innerHTML = "";
    steps.forEach(function (step, index) {
      var li = document.createElement("li");
      var num = document.createElement("span");
      num.className = "step-num";
      num.textContent = String(index + 1);
      var wrap = document.createElement("div");
      var strong = document.createElement("strong");
      strong.textContent = step.title || "";
      var p = document.createElement("p");
      p.textContent = step.body || "";
      wrap.appendChild(strong);
      wrap.appendChild(p);
      li.appendChild(num);
      li.appendChild(wrap);
      list.appendChild(li);
    });
  }

  try {
    var content = window.SITE_CONTENT;
    if (!content) return;
    bindMeta(content);
    bindScalars(content);
    bindOutcomes(content);
    bindCraft(content);
    bindSteps(content);
  } catch (err) {
    console.error("Content bind failed; using HTML fallback.", err);
  }
})();
