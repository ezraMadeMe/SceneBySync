import type { Keyword, Version, Comment } from '../types';

export const DEMO_KEYWORDS: Keyword[] = [
  {
    id: 'k1',
    name: '준호 밤',
    description: '준호 캐릭터의 밤 씬들',
    color: '#8B5CF6',
    sceneNumbers: ['1', '15', '20']
  },
  {
    id: 'k2',
    name: '병원 장면',
    description: '병원 관련 모든 씬',
    color: '#EF4444',
    sceneNumbers: ['1', '2', '20']
  },
  {
    id: 'k3',
    name: '클라이맥스',
    description: '극적 전환점 씬들',
    color: '#F59E0B',
    sceneNumbers: ['15', '20']
  }
];

export const DEMO_VERSIONS: Version[] = [
  {
    id: 'v3.0',
    message: '3막 클라이맥스 완전 재작성',
    author: '김감독',
    date: '2025-10-03 14:30',
    parent: 'v2.1',
    branch: 'main',
    tags: ['최종본', '촬영용'],
    fullText: `#1. 병원 복도 - 낮\n\n준호가 급하게 뛰어온다. 땀에 젖은 얼굴.\n복도 끝에서 의사가 걸어 나온다.\n\n#2. 중환자실 - 낮\n\n수진이 의식을 잃은 채 누워있다.\n심장 박동 모니터 소리만 울린다.\n준호가 울먹이며 손을 잡는다.\n\n준호\n    수진아... 제발... 눈 떠...\n\n#3. 카페 - 저녁\n\n민수가 혼자 커피를 마시며 창밖을 본다.\n비가 내린다. 민수의 눈빛이 흔들린다.\n\n민수\n    (중얼거리며) 내가 미안해...\n
#15. 옥상 - 밤\n\n준호와 민수가 마주선다.\n긴장감이 흐른다.\n\n준호\n    너 때문에 수진이...\n\n준호가 주먹을 쥔다. 민수는 고개를 숙인다.\n\n#20. 병원 옥상 - 새벽\n\n수진의 수술이 끝났다.\n준호가 혼자 앉아 울고 있다.`
  },
  {
    id: 'v2.1',
    message: '민수 캐릭터 감정선 강화',
    author: '이작가',
    date: '2025-10-01 16:20',
    parent: 'v2.0',
    branch: 'main',
    tags: ['검토중'],
    fullText: `#1. 병원 복도 - 낮\n\n준호가 급하게 뛰어온다. 땀에 젖은 얼굴.\n복도 끝에서 의사가 걸어 나온다.\n\n#2. 중환자실 - 낮\n\n수진이 의식을 잃은 채 누워있다.\n심장 박동 모니터 소리만 울린다.\n준호가 손을 잡는다.\n\n#3. 카페 - 낮\n\n민수가 혼자 앉아있다.\n커피 잔을 만지작거린다.\n\n#16. 옥상 - 밤\n\n준호와 민수가 대치한다.\n둘 사이에 긴장감.`
  }
];

export const DEMO_COMMENTS: Comment[] = [
  {
    id: 'c1',
    versionId: 'v3.0',
    sceneNum: '2',
    lineNum: 5,
    author: '박프로듀서',
    text: '이 대사 너무 직설적인 것 같아요. 좀 더 절제된 표현은?',
    date: '2025-10-03 15:00',
    resolved: false
  }
];