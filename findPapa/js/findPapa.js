var btn=document.querySelector('button');
var z=30.00;
var sec=document.getElementById('sec');
var uls=document.querySelector('ul');
var li_1=document.getElementsByClassName('list1')[0];
var score=document.getElementById('score');
var level=1;
var n=0;

var find_num=1;
var show_num=2;
var find_name='./images/find'+find_num+'.png';
var show_name='./images/show'+show_num+'.png';
var temp_img=document.getElementById("checkimg");

//选择要找的图片
var selectImg=document.getElementById('selectImg');
selectImg.onclick=function(){
	find_num=rand(1,9);
	find_name='./images/find'+find_num+'.png';
	temp_img.src=find_name;
}

var back=document.getElementById('back');
btn.onclick=function(){
	
	var timer=setInterval(function(){
		z-=0.01;
		z=z.toFixed(2);
		sec.innerHTML=z;
		if (z<=0) {
			clearInterval(timer);
			if (n<3) {
				alert('终了!'+'  '+'评价:?');
			}else if (n>=20) {
				alert('终了!'+'  '+'评价:厨力惊人');
			}else if (n>=12) {
				alert('终了!'+'  '+'评价:你的眼睛是显微镜吗');
			}else if (n>=9) {
				alert('终了!'+'  '+'评价:哈拉休!');
			}else{
				alert('终了!'+'  '+'评价:听说过星际吗');
			}
			back.style.display='block';
		}
	},10)
	
	btn.remove();
	li_1.remove();
	selectImg.remove();

	app();
	function app(){
		level+=1;
		//循环生成阵型
		for (var i=0;i<level*level;i++) {
			var newLi=document.createElement('li');
			uls.appendChild(newLi);
			var newImg=document.createElement('img');
			newLi.appendChild(newImg);
			
			//缩放
			newLi.style.width=100/level+'%';
			newLi.style.float='left';
			newImg.style.display='block';
			newImg.style.width=100+'%';
			//随机选择
			show_num=rand(1,9);
			do{
				show_num=rand(1,9);
			}while(show_num==find_num);
			show_name='./images/show'+show_num+'.png';
			//插入图片
			newImg.src=show_name;
			newLi.style.backgroundColor='rgb('+rand(50,255)+','+rand(50,255)+','+rand(50,255)+')';
		}
		
		//随机选择一个位置插入图片
		var x=rand(0,level*level-1);
		var game_img=document.querySelectorAll('img');
		game_img[x].src=find_name;
		
		var li=document.querySelectorAll('li');
		li[x].onclick=function(){
			for (var i=0;i<level*level;i++) {
				li[i].remove(this);
			}
			n+=1;
			score.innerHTML=n;
			if (level>10) {
				level=10;
			}
			app();
		}
	}
}

function rand(min,max){
	return Math.round(Math.random()*(max-min)+min);
}