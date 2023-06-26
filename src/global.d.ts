declare module '*.png' {
    const content: any
    export default content
}

declare module '*.svg' {
    import React = require('react');
    export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
    const src: string;
    export default src;
}

declare module '*.jpg' {
    const content: any
    export default content
}

declare module '*.jpeg' {
    const content: any
    export default content
}

declare module '*.gif' {
    const content: any
    export default content
}

declare module '*.webp' {
    const content: any
    export default content
}

declare module '*.avif' {
    const content: any
    export default content
}

declare module '*.ico' {
    const content: any
    export default content
}

declare module '*.bmp' {
    const content: any
    export default content
}
