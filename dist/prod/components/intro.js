"use strict";(()=>{function i(){let e=window.gsap.timeline({defaults:{duration:1,ease:"power4.inOut"}}),r=document.querySelectorAll(".intro_message p");r.forEach(t=>{new window.SplitType(t,{types:"lines",tagName:"span"}).lines.forEach(n=>{let o=document.createElement("div");o.style.overflow="hidden",o.style.display="inline-block",n.parentNode.insertBefore(o,n),o.appendChild(n)}),gsap.set(t.querySelectorAll(".line"),{yPercent:100})}),window.gsap.set(".hero-header_background-video-wrapper",{clipPath:"inset(50%)"}),e.to(".loader-number_wrap",{height:"100%",duration:3}),e.to(".loader-percentage",{scale:4,duration:3},"<"),e.to(".loader-percentage > span",{innerText:100,snap:{innerText:1},duration:3},"<"),e.to(".intro-wrap_loader",{clipPath:"inset(0 0 100% 0)",duration:1},"-=1"),e.from(".heading_cl > *",{yPercent:100,ease:"power4.out",duration:1,stagger:.2},">"),e.from(".heading_2024 > span",{opacity:0,duration:1,stagger:.2},"-=1"),e.to(".intro_logo-wrap",{y:0,scale:1,duration:2},">"),e.to(".hero-header_background-video-wrapper",{clipPath:"inset(0%)",duration:2},"<"),r.forEach((t,a)=>{e.to(t.querySelectorAll(".line"),{yPercent:0,duration:1,ease:"power4.out",stagger:.2}),a<r.length-1&&e.to(t.querySelectorAll(".line"),{yPercent:-100,duration:1,ease:"power4.in",stagger:.2,delay:1.5},"-=0.5"),e.to({},{duration:0})}),e.to(".intro_logo",{yPercent:122},"-=1"),e.to(".menu_wrapper",{y:0},"<+=0.2"),e.to(".header-scroll-ind",{y:0},"<+=0.2")}})();