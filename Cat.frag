#version 330 compatibility


in vec2 vST;
in vec3 vMCposition;



uniform float uKa, uKd, uKs;
uniform float uShininess;
uniform bool uFlat;
flat in vec3 vNf;
in vec3 vNs;
flat in vec3 vLf;
in vec3 vLs;
flat in vec3 vEf;
in vec3 vEs;

uniform vec4 uSpecularColor;




//const vec3 dotColor = vec3(0.,0.,0.);
//const vec3 uSpecularColor = vec3(1.,1.,1.);

uniform float uNoiseAmp;
uniform float uNoiseFreq;



uniform sampler2D Noise2;
uniform float uStripes;

const vec3 waterColor = vec3(0.,0.,1.);
const vec3 mountainColor = vec3(150./255.,75./255.,0.);
const vec3 groundColor = vec3(0.,1.,0.);
const vec3 snowColor = vec3(1.,1.,1.);


uniform float onlySnow = .1;
uniform float snowBlend = .2;
uniform float onlyMountain = .4;
uniform float mountainBlend = .8;

uniform float waterMix = .4;


void main( ){
    
    vec4 nv = texture(Noise2,uNoiseFreq * vST);
    float n = nv.r + nv.g + nv.b + nv.a;    //  1. -> 3.
    n = n - 2.;                             //  -1. -> 1.                           //0. -> 1.
    n*= uNoiseAmp;
   



    vec3 finalColor;
  //  finalColor.r = n;
   // finalColor.g = 0;
   // finalColor.b = 0;
    float dist = abs(int((vST.s + n) *uStripes) +.5 - (vST.s + n)*uStripes);
    if(int((vST.s + n) * uStripes) %2 == 0  ){
       
        //distance from the center, goes between 0. -> .5
        dist*=2.;
        if(dist <= onlySnow){
            finalColor = snowColor;
        }else if(dist > onlySnow && dist <= snowBlend){
            float t = smoothstep(onlySnow,snowBlend,dist);
            finalColor = mix(snowColor,mountainColor,t);
        }else if(dist > snowBlend && dist <= onlyMountain){
            finalColor = mountainColor;
        }else if(dist > onlyMountain && dist <= mountainBlend){
            float t = smoothstep(onlyMountain,mountainBlend,dist);
            finalColor = mix(mountainColor,groundColor,t);
        }else{
            finalColor = groundColor;
        }
     

    }else{
       
        //dist is the distance from the cetner of the stripe
        dist*=2.;
        if(dist > waterMix){
            float t = smoothstep(waterMix,1.,dist);
            finalColor = mix(waterColor,groundColor,t);
        }
        else{
            finalColor = waterColor;
        }
    }
    vec3 Normal;
    vec3 Light;
    vec3 Eye;
    if( uFlat ){
        Normal = normalize(vNf);
        Light = normalize(vLf);
        Eye = normalize(vEf);
    }else{
        Normal = normalize(vNs);
        Light = normalize(vLs);
        Eye = normalize(vEs);
    }
    vec3 ambient = uKa * finalColor;
    float d = max( dot(Normal,Light), 0. );
    vec3 diffuse = uKd * d * finalColor;
    float s = 0.;
    if( dot(Normal,Light) > 0. ){ // only do specular if the light can see the point
        vec3 ref = normalize( 2. * Normal * dot(Normal,Light) - Light );
        s = pow( max( dot(Eye,ref),0. ), uShininess );
    }
    vec3 specular = uKs * s * uSpecularColor.rgb;
 
    gl_FragColor = vec4( ambient.rgb + diffuse.rgb + specular.rgb, 1. );
   // gl_FragColor = vec4(finalColor,1.);
  
}