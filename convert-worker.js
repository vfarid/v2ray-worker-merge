var addresses = [
  "discord.com"
]
addEventListener("fetch", event => {
  var url = new URL(event.request.url)
  var worker = url.searchParams.get('w')
  var address = addresses[Math.floor(Math.random() * addresses.length)]
  var errorMessage = ''
  
  if (worker) {
    try {
      try {
        worker = new URL(worker)
      } catch (e) {
        try {
          worker = new URL("https://" + url.searchParams.get('w'))
        } catch (e) {
          errorMessage =
            `آدرس ورکر ارسالی معتبر نمی‌باشد.
            لطفا آدرس را کامل و همراه با https وارد کنید!`
          throw e
        }
      }
      
      var config = url.searchParams.get('c')
      if (config.substr(0, 8) == "vmess://") {
        try {
          var conf = JSON.parse(atob(config.substr(8)))
          var add = conf.add;
          conf.add = address;
          conf.sni = worker.hostname
          conf.host = worker.hostname
          conf.path = "/" + add + conf.path
          if (conf.tls) {
            conf.fp = "random"
            conf.alpn = "h2,http/1.1"
          }
          return event.respondWith(new Response(
            `<!DOCTYPE html><body dir="rtl" style="font-face: Tahoma; padding: 50px;">` +
            `<h1>این کانفیگ را کپی کرده و در برنامه‌ی v2ray خودتون اضافه کنید:</h1><p>&nbsp;</p><textarea dir="ltr" rows="10" style="width: 50%; min-width: 400px;">` + 
            "vmess://" + btoa(JSON.stringify(conf)) +
            `</textarea></body>`
            , {
              headers: {
                'content-type': 'text/html;charset=UTF-8',
              },
            })
          );
        } catch (e) {
          errorMessage = `کانفیگ ارسالی معتبر نمی‌باشد!`
          throw e
        }
      } else if (config.substr(0, 8) == "vless://" || config.substr(0, 9) == "trojan://") {
        try {
          var conf = {}
          var str = ""
          if (config.substr(0, 8) == "vless://") {
            str = config.substr(8)
            conf.protocol = "vless://"
          } else {
            str = config.substr(8)
            conf.protocol = "trojan://"
          }
          var arr = str.split("@")
          conf.id = arr[0]
          arr = arr[1].split(":")
          conf.address = address
          var host = arr[0]
          var qs = {}
          console.log(conf)
          try {
            var arrx = arr[1].split("?")
            conf.port = parseInt(arrx[0])
            arr = arrx[1].split('#')
            qs = parseQuery(arr[0])
          } catch (e) {
            arr = arr[1].split("#")
            conf.port = parseInt(arr[0])
          }
          conf.name = arr[1]
          qs.path = "/" + host + (qs.path ? qs.path : '/')
          qs.host = worker.hostname
          qs.sni = worker.hostname
          if (qs.tls || qs.security == "tls" || conf.port == 443) {
            if (!(qs.tls || qs.security == "tls")) {
              qs.tls = "tls"
            }
            qs.fp = "random"
            qs.alpn = "h2,http/1.1"
          }
          str = 
            conf.protocol +
            conf.id + "@" +
            conf.address + ":" +
            conf.port + "?" +
            serializeQuery(qs) + "#" +
            conf.name
          return event.respondWith(new Response(
            `<!DOCTYPE html><body dir="rtl" style="font-face: Tahoma; padding: 50px;">` +
            `<h1>این کانفیگ را کپی کرده و در برنامه‌ی v2ray خودتون اضافه کنید:</h1><p>&nbsp;</p><textarea dir="ltr" rows="10" style="width: 50%; min-width: 400px;">` + 
            str +
            `</textarea></body>`
            , {
              headers: {
                'content-type': 'text/html;charset=UTF-8',
              },
            })
          );
        } catch (e) {
          errorMessage = `کانفیگ ارسالی معتبر نمی‌باشد!`
          throw e
        }
      } else {
        errorMessage = `کانفیگ ارسالی معتبر نمی‌باشد!`
        throw 400
      }
    } catch (e) {
      throw e
      return event.respondWith(new Response(`
        <div dir="rtl">` +
        errorMessage +
        `</div>`, {
        status: 400,
        headers: {
          'content-type': 'text/html;charset=UTF-8',
        },
      }))
    }
  }

  var html = `<!DOCTYPE html>
  <body dir="rtl" style="font-face: Tahoma; padding: 50px;">
    <h1>
      بازنویسی کانفیگ‌های (vmess, vless, trojan)
      همراه با worker
    </h1>
    <form method="GET">
      <p>
        <label>
          آدرس worker خود را وارد کنید:<br/>
          <input name="w" dir="ltr" autofocus="true" style="width: 50%; min-width: 400px;"/>
        </babel>
      </p>
      <p>&nbsp;</p>
      <p>
        <label>
          کانفیگ خود را وارد کنید:<br/>
          <textarea name="c" dir="ltr" rows="10" style="width: 50%; min-width: 400px;"></textarea>
        </babel>
      </p>
      <p>&nbsp;</p>
      <p>
        <button name="start"><strong>تبدیل کن</strong></button>
      </p>
    </form>
  </body>`;

  return event.respondWith(new Response(html, {
    headers: {
      'content-type': 'text/html;charset=UTF-8',
    },
  }));
})

function parseQuery(queryString) {
  var query = {};
  var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split('=');
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
  }
  return query;
}

function serializeQuery(obj) {
  var str = [];
  for (var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
}
