/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/get_projects/:path*',
                destination: 'http://127.0.0.1:8000/get_projects/:path*', // 替换为实际的 API URL
            },
        ];
    },
};

export default nextConfig;
